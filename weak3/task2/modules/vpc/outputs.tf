output "vpc_id" {
  description = "Vpc id"
  value = aws_vpc.task2_vpc.id
}

output "public_subnets" {
  description = "List of public subnets"
  value = [for s in aws_subnet.public_subnet : s.id]
}