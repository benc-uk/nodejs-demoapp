locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  aws_region = "eu-north-1"
  # user_data_path = find_in_parent_folders("_envcommon/user_data/user-data.sh")
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
}
EOF
}

remote_state {
  backend = "s3"
  config = {
    encrypt = true
    bucket  = "5252-terragrunt-tf-state-${local.aws_region}"
    key     = "${path_relative_to_include()}/tf.tfstate"
    region  = local.aws_region
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

inputs = local.environment_vars.locals

# inputs = merge(
#   local.environment_vars.locals,
#   {
#     user_data_path = local.user_data_path
#   }
# )