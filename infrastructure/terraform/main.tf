provider "aws" {
  region = var.aws_region
}

# ==========================================
# VARIABLES
# ==========================================
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "app_name" {
  type    = string
  default = "future-self-simulator"
}

# ==========================================
# AMAZON COGNITO (AUTHENTICATION)
# ==========================================
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.app_name}-user-pool-${var.environment}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 7
      max_length = 256
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "${var.app_name}-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret     = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# ==========================================
# AMAZON DYNAMODB (DATABASE - SINGLE TABLE DESIGN)
# ==========================================
resource "aws_dynamodb_table" "single_table" {
  name         = "FutureSelfSimulatorTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  # Global Secondary Index for querying entities (e.g. searching email maps)
  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "TimeToLive"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

# ==========================================
# AMAZON S3 BUCKET (STATIC REPORT STORAGE)
# ==========================================
resource "aws_s3_bucket" "report_bucket" {
  bucket = "${var.app_name}-reports-${var.environment}"

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.report_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ==========================================
# IAM ROLES (LAMBDA SERVICE PERMISSIONS)
# ==========================================
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.app_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.app_name}-lambda-policy-${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.single_table.arn
      },
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.report_bucket.arn}/*"
      },
      # Amazon Bedrock execution permission
      {
        Action = [
          "bedrock:InvokeModel"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:bedrock:*:*:model/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# ==========================================
# AWS LAMBDA & API GATEWAY
# ==========================================

# Lambda Handler zip package placeholder
resource "aws_lambda_function" "api_lambda" {
  function_name = "${var.app_name}-backend-${var.environment}"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "dist/server.handler" # handler mapping
  runtime       = "nodejs20.x"
  timeout       = 30

  # Dummy zip package for setup
  filename      = "lambda_placeholder.zip"
  lifecycle {
    ignore_changes = [filename]
  }

  environment {
    variables = {
      PROVIDER_MODE           = "aws"
      AWS_DYNAMODB_TABLE_NAME = aws_dynamodb_table.single_table.name
      AWS_S3_BUCKET_NAME      = aws_s3_bucket.report_bucket.name
      AWS_COGNITO_USER_POOL_ID = aws_cognito_user_pool.user_pool.id
      AWS_COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.client.id
    }
  }
}

# API Gateway REST definition
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.app_name}-api-${var.environment}"
  description = "API Gateway for Future Self Simulator"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_any" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy_any.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_lambda.invoke_arn
}

# ==========================================
# OUTPUTS
# ==========================================
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.user_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.single_table.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.report_bucket.name
}
