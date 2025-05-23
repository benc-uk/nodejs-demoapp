variable "desired_capacity_alb" {
  description = "Desired number of EC2 instances in the ASG"
  type        = number
}

variable "min_capacity_alb" {
  description = "Minimum number of instances in the ASG"
  type        = number
}

variable "max_capacity_alb" {
  description = "Maximum number of instances in the ASG"
  type        = number
}

variable "public_subnets" {
  description = "List of public subnet IDs for the ASG"
  type = list(string)
}

variable "target_group_arn" {
  description = "ARN of the ALB target group to attach to ASG"
  type        = string
}

variable "launch_template_id" {
  description = "ID of the EC2 launch template"
  type        = string
}
