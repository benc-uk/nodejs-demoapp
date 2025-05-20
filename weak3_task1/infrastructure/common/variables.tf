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
