variable "env_name" {
  description = "This var used only to name vpc"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC cidr"
  type = string
}

variable "subnet_az" {
  description = "AZs for public subnets"
  type = list(string)
}

variable "public_subnet_cidr_blocks" {
  description = "List of cidr's which are applied to AZs"
  type = list(string)
}
