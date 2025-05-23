include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependency "asg" {
  config_path = "../asg"
}

dependency "sns" {
  config_path = "../sns"
}

terraform {
  source = "../../../../modules/cloudwatch"
}

inputs = {
  scale_up_threshold = 50
  asg_name           = dependency.asg.outputs.asg_name
  scale_up_sns_topic = dependency.sns.outputs.sns_arn
}
