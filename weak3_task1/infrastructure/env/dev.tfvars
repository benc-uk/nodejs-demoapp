region = "eu-north-1"

desired_capacity_alb = 2
min_capacity_alb     = 1
max_capacity_alb     = 3

threshold_cloudwatch = 60

env_name = "dev"

vpc_cidr = "10.1.0.0/16"

subnet_az = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]

demo_public_subnet_cidr_blocks = [
  "10.1.1.0/24",
  "10.1.2.0/24",
  "10.1.3.0/24"
]
