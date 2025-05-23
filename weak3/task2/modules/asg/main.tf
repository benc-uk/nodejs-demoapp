resource "aws_autoscaling_group" "demo_asg" {
  desired_capacity    = var.desired_capacity_alb
  max_size            = var.max_capacity_alb
  min_size            = var.min_capacity_alb
  vpc_zone_identifier = var.public_subnets
  target_group_arns = [var.target_group_arn]

  launch_template {
    id      = var.launch_template_id
    version = "$Latest"
  }
  tag {
    key                 = "Name"
    value               = "demo-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}
