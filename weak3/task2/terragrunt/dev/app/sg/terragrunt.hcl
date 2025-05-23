include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependency "vpc" {
  config_path = "../../vpc"
}

terraform {
  source = "../../../../modules/sg"
}

inputs = {
  vpc_id = dependency.vpc.outputs.vpc_id
}