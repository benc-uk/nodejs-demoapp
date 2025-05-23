include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependency "vpc" {
  config_path = "../../vpc"
}

dependency "sg" {
  config_path = "../sg"
}

terraform {
  source = "../../../../modules/alb"
}

inputs = {
  vpc_id         = dependency.vpc.outputs.vpc_id
  public_subnets = dependency.vpc.outputs.public_subnets
  alb_sg         = dependency.sg.outputs.alb_sg
}
