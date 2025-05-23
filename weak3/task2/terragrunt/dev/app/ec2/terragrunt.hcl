include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependency "sg" {
  config_path = "../sg"
}

terraform {
  source = "../../../../modules/ec2_template"
}

inputs = {
  ec2_sg          = dependency.sg.outputs.ec2_sg
}
