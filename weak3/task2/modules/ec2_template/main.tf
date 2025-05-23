resource "aws_launch_template" "demo_lt" {
  name_prefix   = "demo-lt-"
  image_id      = var.ec2_ami_id
  instance_type = var.ec2_instance_type

  user_data = base64encode(file(var.path_to_user_data))

  network_interfaces {
    associate_public_ip_address = true
    security_groups = [var.ec2_sg]
  }

  lifecycle {
    create_before_destroy = true
  }
}