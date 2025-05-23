locals {
  environment = "dev"
  path_to_user_data = "${get_terragrunt_dir()}/../_envcommon/user_data/user-data.sh"
}