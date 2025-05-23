variable "scale_up_threshold" {
  description = "Number of CPU loading after which will be scaling up"
  type = number
}

variable "asg_name" {
  description = "ASG name"
  type = string
}

variable "scale_up_sns_topic" {
  description = "Connect sns topic to notify certain emails about scaling up"
  type = string
}