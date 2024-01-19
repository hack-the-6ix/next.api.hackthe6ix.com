terraform {
  required_providers {
    azure = {
      source = "hashicorp/azurerm"
      version = ">=3.86.0"
    }
  }
}

provider "azure" {
  skip_provider_registration = true
  features {}
}

resource "azurerm_resource_group" "api-group" {
  name = "${var.env}.api.hackthe6ix.com"
  location = "can-central"
}