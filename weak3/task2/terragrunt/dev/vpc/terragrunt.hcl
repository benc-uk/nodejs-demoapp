include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/vpc"
}

inputs = {
  vpc_cidr = "10.1.0.0/16"
  env_name = "dev"
  subnet_az = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
  public_subnet_cidr_blocks = [
    "10.1.1.0/24",
    "10.1.2.0/24",
    "10.1.3.0/24"
  ]
}
