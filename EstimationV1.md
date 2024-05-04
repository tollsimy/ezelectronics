# Project Estimation - CURRENT
Date: 04/05/2024

Version: V1.0

# Estimation approach
Consider the EZElectronics project in CURRENT version (as given by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |           37                |             
|  A = Estimated average size per class, in LOC       |             100               | 
| S = Estimated size of project, in LOC (= NC * A) | 3700 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |      370                                |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 11100 | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |        about 4            |         

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| requirement document  | 120 |
| GUI prototype | 60 |
| design document | -  |
| code | 370 |
| unit tests | - |
| api tests | 20 |
| management documents  | 20 |

# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| **1. requirement document**  | **120** |
| 1.1 Business model, stakeholders, context diagram, interfaces | 20 |
| 1.2 Functional and non functional requirements | 20 |
| 1.3 Use case diagram and use cases | 30 |
| 1.4 Scenarios | 40 |
| 1.5 Glossary | 10 |
| **2. GUI prototype** | **60** |
| 2.1 Home Screen | 10 |
| 2.2 Login Screen | 10 |
| 2.3 Account Screen | 10 |
| 2.4 Product Screen | 10 |
| 2.5 Cart Screen | 10 |
| 2.6 Payment Screen | 10 |
| **3. design document** | **-** |
| **4. code** | **370** |
| 4.1 Components | 50 |
| 4.2 Controllers | 60 |
| 4.3 DAOs | 50 |
| 4.4 DB | 30 |
| 4.5 Error Handling | 20 |
| 4.6 API Routes | 50 |
| 4.7 Frontend | 80 |
| 4.8 Miscellaneous | 20 |
| **5. unit tests** | **-** |
| **6. api tests** | **20** |
| 6.1 user tests | 7 |
| 6.2 product tests | 6 |
| 6.3 cart tests | 7 |
| **7. management documents**  | **20** |
| 7.1 Project Plan | 10 |
| 7.2 Gantt Chart | 10 |

###
![gantt chart](/assets/gantt_V1.png)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size | 270h | 1.7 weeks |
| estimate by product decomposition | 490h | 3.1 weeks |
| estimate by activity decomposition | 490h | 7 weeks |

The difference between the estimates is due to the level of detail and the **scope of the estimation**.

The size estimation is mainly focued on the code, while the other two estimations consider the **entire process** of developing the product. 

The activity decomposition estimation provides the most detailed estimate, as it breaks down the effort of each activity. Moreover, through gantt chart, we can state that the estimated duration is even longer due to the fact that **not all activities can be done in parallel**.



