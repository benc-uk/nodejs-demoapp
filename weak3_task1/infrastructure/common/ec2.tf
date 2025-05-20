resource "aws_launch_template" "demo_lt" {
  name_prefix   = "demo-lt-"
  image_id      = "ami-0c1ac8a41498c1a9c"
  instance_type = "t3.micro"

  user_data = base64encode(file("../../user_data/user-data.sh"))

  network_interfaces {
    associate_public_ip_address = true
    security_groups = [aws_security_group.demo_ec2_sg.id]
  }

  lifecycle {
    create_before_destroy = true
  }
}