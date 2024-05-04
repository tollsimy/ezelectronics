# Project Estimation - FUTURE
Date: 04/05/2024

Version: V1.0

# Estimation approach
Consider the EZElectronics project in FUTURE version (as proposed by your team in requirements V2), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch (not from V1)
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |           60    |             
|  A = Estimated average size per class, in LOC   |             150               | 
| S = Estimated size of project, in LOC (= NC * A) | 9000 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |      900   |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 27000 | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |        about 6      |         

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| Requirement document  | 120 |
| GUI prototype | 120 |
| Design document | - |
| Code | 560 |
| Unit tests | 80 |
| Api tests | 40 |
| Management documents  | 30 |

# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| **1. requirement document**  | **120** |
| 1.1 Business model, stakeholders, context diagram, interfaces | 20 |
| 1.2 Functional and non functional requirements | 30 |
| 1.3 Use case diagram and use cases | 50 |
| 1.4 Scenarios | 50 |
| 1.5 Glossary | 10 |
| **2. GUI prototype** | **120** |
| 2.1 Home Screen | 10 |
| 2.2 Login Screen | 10 |
| 2.3 Account Screen | 10 |
| 2.4 List of Products Screen|10|
| 2.5 Product Screen | 10 |
| 2.6 Cart Screen | 10 |
| 2.7 Payment Screen | 10 |
| 2.8 Order Screen|10|
| 2.9 WishList Screen|10|
| 2.10 Chat with support team|30|
| **3. design document** | **-** |
| **4. code** | **560** |
| 4.1 Components | 70 |
| 4.2 Controllers | 100 |
| 4.3 DAOs | 60 |
| 4.4 DB | 30 |
| 4.5 Error Handling | 50 |
| 4.6 API Routes | 80 |
| 4.7 Frontend | 150 |
| 4.8 Miscellaneous | 20 |
| **5. unit tests** | **80** |
| 5.1 user tests | 10 |
| 5.2 product tests | 10 |
| 5.3 cart tests | 10 |
| 5.4 payment tests | 10 |
| 5.5 wishlist tests | 10 |
| 5.6 order tests| 10 |
| 5.7 chat tests | 20 |
| **6. api tests** | **40** |
| 6.1 user tests | 7 |
| 6.2 product tests | 6 |
| 6.3 cart tests | 7 |
| 6.4 payment tests | 7 |
| 6.5 wishlist tests | 6 |
| 6.6 order tests| 7 |
| 6.7 chat tests | 7 |
| **7. management documents**  | **30** |
| 7.1 Project Plan | 15 |
| 7.2 Gantt Chart | 15 |

###
![gantt chart](/assets/gantt_V2.png)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size | 900h | 5.6 weeks |
| estimate by product decomposition | 950h | 6 weeks |
| estimate by activity decomposition | 950h | 11 weeks |

The difference between the estimates is due to the level of detail and the **scope of the estimation**.

The size estimation is mainly focued on the code, while the other two estimations consider the **entire process** of developing the product. 

The activity decomposition estimation provides the most detailed estimate, as it breaks down the effort of each activity. Moreover, through gantt chart, we can state that the estimated duration is even longer due to the fact that **not all activities can be done in parallel**.