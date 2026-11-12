variable "aws_region" {
  description = "Região da AWS onde os recursos serão criados."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto, usado nos nomes e nas tags dos recursos."
  type        = string
  default     = "todo-api-devops"
}

variable "instance_type" {
  description = "Tipo da instância EC2 (t3.micro faz parte do free tier em contas novas)."
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Porta em que a API Node.js escuta."
  type        = number
  default     = 3000
}

variable "allowed_ssh_cidr" {
  description = "Faixa de IP autorizada a acessar a porta 22 (SSH). Use o seu IP no formato x.x.x.x/32."
  type        = string
}

variable "key_name" {
  description = "Nome de um key pair já existente na AWS para acesso SSH (opcional)."
  type        = string
  default     = null
}
