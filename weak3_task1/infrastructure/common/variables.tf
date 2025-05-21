variable "region" {
  type    = string
  default = "eu-north-1"
}

variable "desired_capacity_alb" {
  type = number
}

variable "min_capacity_alb" {
  type = number
}

variable "max_capacity_alb" {
  type = number
}

variable "threshold_cloudwatch" {
  type = number
}

variable "env_name" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "subnet_az" {
  type = list(string)
}

variable "demo_public_subnet_cidr_blocks" {
  type = list(string)
}

variable "ec2_ami_id" {
  type    = string
  default = "ami-0c1ac8a41498c1a9c"
}

variable "ec2_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "alert_email" {
  description = "Pull of emails for scaling up alarms"
  type = list(string)
  default = []
}
