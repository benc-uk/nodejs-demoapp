resource "aws_vpc" "task2_vpc" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = "demo-${var.env_name}-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  count = length(var.public_subnet_cidr_blocks)
  availability_zone = var.subnet_az[count.index % length(var.subnet_az)]
  cidr_block        = var.public_subnet_cidr_blocks[count.index]
  vpc_id            = aws_vpc.task2_vpc.id

  tags = {
    Name = "demo-${var.env_name}-public-subnet-${var.subnet_az[count.index]}"
  }
}

resource "aws_internet_gateway" "vpc_igw" {
  vpc_id = aws_vpc.task2_vpc.id
}

resource "aws_route_table" "vpc_rt" {
  vpc_id = aws_vpc.task2_vpc.id

  route{
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vpc_igw.id
  }

  tags = {
    Name = "demo-${var.env_name}-route-table"
  }
}

resource "aws_route_table_association" "public_subnet_assoc" {
  count          = length(var.public_subnet_cidr_blocks)
  subnet_id      = aws_subnet.public_subnet[count.index].id
  route_table_id = aws_route_table.vpc_rt.id
}

