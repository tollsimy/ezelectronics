# Requirements Document - current EZElectronics

Date:30/04/2024

Version: V1.6

| Version number | Change |
| :------------: | :----: |
|       V1.1        | Define StakeHolders, Actors, Table of Rights, Functional requirements, Stories and Personas, Interfaces, Context Diagram, NFR |
|       V1.2        | Add Use Case Diagram and Use cases |
|       V1.3        | Update Use cases, add glossary, fix FRs, format document |

# Contents

- [Requirements Document - current EZElectronics](#requirements-document---current-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Table of rights](#table-of-rights)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name      | Description |
| :--------------:      | :---------: |
| Customer user         | People that want to buy electronics products  |
| Manager user          | Electronics products companies that are register in the platform|
| Board of directors    | All EZElectonics stakeholders|
| Competitors           | Other online electronics component stores |
| Payment service       | All method that allow user to pay products in the cart|
| Developer             | The team in charge of developing the platform|

# Context Diagram and interfaces

## Context Diagram

![context diagram](assets/Context_Diagram.png)

| Actor             | Description |
| :--------------:  | :---------: |
| Customer user     |  People that want to buy electronics products  |
| Manager user      |  Electronics products companies that are register in the platform|
| Payment service   | All method that allow user to pay pruducts in the cart|
|Developer          | The team in charge of developing the platform|

## Interfaces

|   Actor       | Logical Interface | Physical Interface    |
| :-------:     | :---------------: | :----------------:    |
|Customer user  | GUI               | PC,Smartphone         |
|Manager user   | GUI               | PC                    |
|Payment service| Internet          | Intenet               |
|Developer      | CLI               | PC                    |


# Stories and personas

- Customer user Leonardo:  He is a regular costumer who likes to be a maker, who spends his free time in buying electronics components for his embedded systems projects. He browses around the website looking for the suitable components for his designs adding them to the cart. Once he has done with the research, he buys stuff paying online with the different offered channel.
- Manager user Lisa: She is the sales manager of the STMicroelectronics company, who has a company profile in the website, she can upload when required new sensors and board of its company.
- Developer Simone: He is the one in charge to manage the website databeses to ensure the correct placement of product, the list of the signed users

# Functional and non functional requirements

## Functional Requirements

|  ID   | Description |
| :---: | :---------: |
|   FR1|Authorize and Authenticate|
|       FR1.1|Log in |
|       FR1.2|Log Out |
|   FR2|Manage Account |
|       FR2.1|Get Account Information |
|       FR2.2|Create Account|
|       FR2.3|Delete Account|
|   FR3|Manage products|
|       FR3.1|Add a product|
|       FR3.2|Add quantity to a product|
|       FR3.3|Mark a product as sold|
|       FR3.4|Delete a specific product|
|   FR4|Show products|
|       FR4.1|Show the product that matches an ID|
|       FR4.2|Show all products of a category|
|       FR4.3|Show all products that match a specific model|
|       FR4.4|Show all products|
|   FR5|Manage carts|
|       FR5.1|Show current cart|
|       FR5.2|Add a product to the cart|
|       FR5.3|Remove a product from the cart|
|       FR5.4|Delete the current cart|
|       FR5.5|Show the history of paid carts|
|   FR6|Manage transaction|
|       FR6.1|Pay for the current cart|

## Table of rights

|  Actor    | FR1.1 | FR1.2 | FR2.1 | FR2.2 | FR2.3 | FR3.1 | FR3.2 | FR3.3 | FR3.4 | FR4.1 | FR4.2 | FR4.3 | FR4.4 | FR5.1 | FR5.2 | FR5.3 | FR5.4 | FR5.5 | FR6.1 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|Non-registered user    |Y|Y|Y|Y|Y|N|N|N|N|N|N|N|N|N|N|N|N|N|N|
|Customer user          |Y|Y|Y|Y|Y|N|N|N|N|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|
|Manager user           |Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|N|N|N|N|N|N|
|Developer              |Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|

## Non Functional Requirements

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :---------------------------------: | :---------: | :-------: |
|  NFR1   | Usability                          | Website GUI should be able to adapt to both desktop (up to 30in displays) and mobile screens (down to 4in displays) | GUI |
|  NFR2   | Efficiency                         | All back-end operations should be performed in less that 0.1s | server |
|  NFR3   | Reliability                        | The platform should be able to perform a backup and restore it every 24h | database |
| NFR4    | Scalability                        | The platform should be able to handle up to 1000 simultaneous users | server/database |
| NFR5    | Scalability                        | The platform should be able to handle up to 1000000 simultaneous products | server/database |
| NFR6    | Maintainability                    | The platform should be able to be updated without stopping the service | server |
| NFR7    | Availability                       | The platform should be available 99.99% of the time | server |
| NFR8    | Legal                              | The platform should be compliant with GDPR and EU laws | whole platform |

# Use case diagram and use cases

## Use case diagram

![use case diagram](assets/UseCase_Diagram.png)

|ID| Use Case  | Actor|
|:-----:|:-----: |:-----: 
|UC1|Login| Users |
|UC2|Logout| Users |
|UC3|Create new user| Non-registered users|
|UC4|Manage Account| Users|
|UC5|Manage Cart| Customer Users|
|UC6|Pay Current Cart| Customer Users|
|UC7|Show Products| Users|
|UC8|Manage Products| Manager Users|

### Use case 1, UC1

| Actors Involved  |  Customer User, Manager User   |
| :--------------: | :------------------------------------------------------------------:    |
|   Precondition   | User has an account                                |
|  Post condition  |  User is logged-in                                 |
| Nominal Scenario |  User insert username and password in order to authenticate himself/herself (UC1.1)|
|     Variants     |   -  |
|    Exceptions    |   Wrong credentials(UC1.2)                         |

#### Scenario UC1.1

|  Scenario UC1.1  |           |
| :------------: | :------------------------------------------------------------------------:  |
|  Precondition  | User has a Customer account                              |
| Post condition |  User is logged-in as customer                           | 
|     Step#      |      Description                                         |
|       1        |     insert the username                                  |
|       2        |     insert password                                      |
|       3        |     click login                                          |

#### Scenario UC1.2
|  Scenario UC1.2  |                |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account |
| Post condition |  User is not logged in |
|     Step#     |        Description      |
|       1       |     insert the username               |
|       2       |     insert password          |
|       3       |     check "manager account" if user is logging in as manager  |
|       3       |     click login        |
|       4       |     System show "Incorrect username and/or password" -> go to step 1   |

### Use case 2, UC2

| Actors Involved  |  Customer User, Manager User   |
| :--------------: | :------------------------------------------------------------------:    |
|   Precondition   | User is logged in                                |
|  Post condition  |  User is not logged anymore                                |
| Nominal Scenario |  User clicks on logout button to deauthenticate himself/herself (UC2.1)|
|     Variants     |   -  |
|    Exceptions    |   -  |

#### Scenario UC2.1

|  Scenario UC2.1  |           |
| :------------: | :------------------------------------------------------------------------:  |
|  Precondition  | User is logged in                                     |
| Post condition |  User is not logged anymore                           | 
|     Step#      |      Description                                      |
|       1        |     click on logout button                            |
|       2        |     click confirm                                     |

### Use case 3, UC3

| Actors Involved  |  User  |
| :--------------: | :------------------------------------------------------------------:    |
|   Precondition   | New user wants to access the platform but does not have an account |
|  Post condition  |  New user has an account |
| Nominal Scenario |  User clicks on signup button and fills data to create a new account (UC3.1)|
|     Variants     |   User want to create a manager account (UC3.2)  |
|    Exceptions    |   Username already existing (UC3.3)  |

#### Scenario UC3.1


# Glossary

- User
    - Person who uses the platform and that has an account
- Customer User
    - User who buys products
- Manager User
    - User who manages products
- Cart
    - List of products that a customer wants to buy
    - It has an id, it is associated to a customer user, it has a list of products, a total price and a payment date
- Product
    - Electronic component available for sale
    - It can be associated to zero or more carts
    - It has a unique code, a selling price, a model, a category, a selling date, an arrival date and details

![glossary](assets/Glossary.png)

# System Design

# Deployment Diagram

\<describe here deployment diagram >
