region = "eu-west-1"

desired_capacity_alb = 1
min_capacity_alb     = 1
max_capacity_alb     = 3

ec2_ami_id = "ami-0df368112825f8d8f"
ec2_instance_type= "t2.micro"

threshold_cloudwatch = 15

env_name = "dev"

vpc_cidr = "10.1.0.0/16"

subnet_az = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]

demo_public_subnet_cidr_blocks = [
  "10.1.1.0/24",
  "10.1.2.0/24",
  "10.1.3.0/24"
]
