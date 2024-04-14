# Requirements Document - current EZElectronics

Date:

Version: V1 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|       V1.1        |    Define StakeHolders, Actors, Table of Rights, Functional requirements, Stories and Personas, Interfaces, Context Diagram, NFR   |

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

| Stakeholder name | Description |
| :--------------: | :---------: |
| Customer user         |  People that want to buy electronics products  |
| Manager user |  Electronics products companies that are register in the platform|
| Board of directors   |  All EZElectonics stakeholders|
| Competitors       | Other online electronics component stores |
| Payment service  | All method that allow user to pay pruducts in the cart|
|Developer| The team in charge of developing the platform|



# Context Diagram and interfaces

## Context Diagram

![alt text](assets/Context_Diagram.png)

| Actor | Description |
| :--------------: | :---------: |
| Customer user         |  People that want to buy electronics products  |
| Manager user |  Electronics products companies that are register in the platform|
| Payment service  | All method that allow user to pay pruducts in the cart|
|Developer| The team in charge of developing the platform|

## Interfaces

|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Customer user |     GUI            |     PC,Smartphone|
|Manager user| GUI              |        PC         |
|Payment service| Internet      |     Intenet         |
|Developer| CLI         | PC|


# Stories and personas

- Customer user Leonardo:  He is a regular costumer who likes to be a maker, who spends his free time in buying electronics components for his embedded systems projects. He browses around the website looking for the suitable components for his designs adding them to the cart. Once he has done with the research, he buys stuff paying online with the different offered channel.
- Manager user Lisa: She is the sales manager of the STMicroelectronics company, who has a company profile in the website, she can upload when required new sensors and board of its company.
- Developer Simone: He is the one in charge to manage the website databeses to ensure the correct placement of product, the list of the signed users

# Functional and non functional requirements

## Functional Requirements



|  ID   | Description |
| :---: | :---------: |
|FR1  |     Authorize and  Authenticate      |
|   FR1.1|   Log in Log Out          |
|   FR1.2 |   Manage Account    |
|     FR1.2.1|  Create Account|
|     FR1.2.2|  Delete Account|
|     FR1.2.3|  Delete All Accounts|
|FR2|Manage products|
|   FR2.1|Add a pruduct|
|   FR2.2|Mark a pruduct as sold|
|   FR2.3|Delete all products|
|FR3|Manage carts|
|   FR3.1|Show current cart|
|   FR3.2|Add a product to the cart|
|   FR3.3| Remove a product from the cart|
|   FR3.4| Revove all products in the current cart|
|   FR3.5|Remove all existing carts|
|   FR3.6|Show the history of paid carts|
|F4|Manage transaction|
|   F4.1|Pay for the current cart|


## Table of rights

|  Actor   |FR1.1|FR1.2.1|FR1.2.2|FR1.2.3|FR2.1|FR2.2|FR2.3|FR3.1|FR3.2|FR3.3|FR3.4|FR3.5|FR3.6|F4.1|
| :---: | :--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |:--: |
|Customer user| Y|Y|Y|N|N|N|N|Y|Y|Y|Y|N|Y|Y|
|Manager user | Y|Y|Y|N|Y|Y|N|Y|Y|Y|Y|N|Y|Y|
|Developer | Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|Y|







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

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
