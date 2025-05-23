include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependency "vpc" {
  config_path = "../../vpc"
}

dependency "alb" {
  config_path = "../alb"
}

dependency "ec2_template" {
  config_path = "../ec2"
}

terraform {
  source = "../../../../modules/asg"
}

inputs = {
  desired_capacity_alb = 1
  min_capacity_alb     = 1
  max_capacity_alb     = 2
  public_subnets       = dependency.vpc.outputs.public_subnets
  target_group_arn     = dependency.alb.outputs.target_group_arn
  launch_template_id   = dependency.ec2_template.outputs.lt_id
}
