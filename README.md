# ADS Revision Sheet Documentation

A Google Sheets-based system for managing and tracking Data Structures & Algorithms (DSA) problem-solving practice with automated revision scheduling and performance tracking.

## Table of Contents

- [Setup Guide](#setup-guide)
- [Sheet Structure](#sheet-structure)
- [Features](#features)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Setup Guide

### 1. Create a Copy

1. Open the template [sheet](https://docs.google.com/spreadsheets/d/1L0B544Bko33Iss_IiUfdDo1mCkOFakryV3Jye2hrdtA/edit?usp=sharing)
2. Create a copy by going to File > Make a copy
   <img width="1512" alt="Screenshot 2024-12-26 at 2 21 42 AM" src="https://github.com/user-attachments/assets/d8625a97-5e38-4c27-b793-f436a25eda98" />
3. Rename it as desired
   <img width="1512" alt="Screenshot 2024-12-26 at 2 22 31 AM" src="https://github.com/user-attachments/assets/c17b3320-a09f-4f56-b37a-fdb9757cc149" />

### 2. Enable Apps Script

1. Go to Extensions > Apps Script
2. This will open the Apps Script editor in a new tab
   <img width="1512" alt="Screenshot 2024-12-26 at 2 23 22 AM" src="https://github.com/user-attachments/assets/f8f1aeb9-3c57-4555-8fd8-860495e8a78c" />
3. You'll see multiple .gs files:
   - Revision.gs
   - TimeUpdatingTrigger.gs
   - ScoreUpdatingTrigger.gs
   - AdsShinFeats.gs
     <img width="1512" alt="Screenshot 2024-12-26 at 2 24 02 AM" src="https://github.com/user-attachments/assets/2df28bbd-93ba-4c3b-bfde-e4765f41888f" />

### 3. Set Up Triggers

You need to set up two time-based triggers:

#### Timer Update Trigger

1. In Apps Script, go to Triggers (clock icon on the left sidebar)

<img width="745" alt="Screenshot 2024-12-26 at 9 15 16 PM" src="https://github.com/user-attachments/assets/62078d82-d4e5-4802-ac54-8e181b9e5804" />

2. Click '+ Add Trigger'

<img width="745" alt="Screenshot 2024-12-26 at 9 16 12 PM" src="https://github.com/user-attachments/assets/990b3f17-9016-47e1-9bc3-2ebebffa48de" />

3. Configure as follows:
   - Choose function to run: `updateTimers`
   - Choose which deployment: Head
   - Select event source: Time-driven
   - Select type of time: Minutes timer
   - Select interval: Every minute
   - Click on the `Save` button

<img width="886" alt="Screenshot 2024-12-26 at 9 18 58 PM" src="https://github.com/user-attachments/assets/f8431e8a-c36b-4889-b56e-88ba132371e6" />

- You will get a popup asking for permission to run the trigger, as follows:

   <img width="886" alt="Screenshot 2024-12-26 at 9 21 08 PM" src="https://github.com/user-attachments/assets/a0ae9892-4102-462e-8f16-e015615ac248" />
   
   - Click on Allow. This will allow the trigger to keep running in the background. This trigger updates the timers visible on the sheet. 
   
   <img width="886" alt="Screenshot 2024-12-26 at 9 21 31 PM" src="https://github.com/user-attachments/assets/50cb3d54-c6c6-45c4-a86e-6cd65cdc26d3" />

#### Score Update Trigger

1. Add another trigger
2. Configure as follows:
   - Choose function to run: `updateScores`
   - Choose which deployment: Head
   - Select event source: Time-driven
   - Select type of time: Day timer
   - Select time of day: 3 AM to 4 AM
   - Click `Save`
     <img width="886" alt="Screenshot 2024-12-26 at 9 23 59 PM" src="https://github.com/user-attachments/assets/17eb4a0f-526f-489a-8663-7f35e6baa950" />

You might not be asked for permissions now, as the project already has them.

## Sheet Structure

### 1. Solved Problems Sheet

Main sheet for tracking all solved problems with columns for:

- Problem ID
- Problem Name
- Platform
- Difficulty
- Time Taken
- Last Solved
- Tags (Own & Referred)
- Score (automatically calculated)

- **Purpose**: Track all solved problems.
- **Usage Steps**:
  - Enter problem details in the respective columns.
  - Change the `START` to `STOP`, so that the timer can start.
  - After solving the problem change `STOP` to `START`.
  - The score gets updated because of the `updateScore` trigger previously.
  - Make sure to update the tags after solving each problem.
  - Also add the time complexities if you want to track the possible solutions.
  - Refer to the sample entries.

<img width="1511" alt="Screenshot 2024-12-26 at 10 54 31 PM" src="https://github.com/user-attachments/assets/2132e99e-384b-407a-993b-ac88ea7d20c6" />


### 2. Revision Sheet

Generated sheet for active revision sessions containing:

- Selected problems for revision
- Timer controls
- Tag updates
- Hint button to see hints if you are stuck. Hints are just notes previously added on the main sheet.
- Rest of the layouts are similar to the main sheet.

- **Purpose**: Manage active revision sessions.
- **Usage Steps**:
  - Select problems for revision.
  - Use timer controls to track time spent on each problem.
  - **Generate Revision**:
    - Click the "Generate Revision" button under the `Revision` menu to automatically select and load problems into the Revision sheet based on configured criteria.
    - Ensure the "Solved Problems" sheet has valid data and scores before generating.
  - **End Revision**:
    - Click the `End Revision` button to finalize the session.
    - Review and update tags for each problem before syncing to the "Solved Problems" sheet.
    - Confirm that all required fields (e.g., time taken, last solved date) are filled out.
    - Once ended the data gets synced back to the main sheet with revisions counts and solutions updated.
  - **Clear Active Revision**:
    - Click the `Clear Active Revision` button to remove all data from the Revision sheet while keeping the headers intact.
    - This action is useful for starting a new revision session without residual data.

<img width="910" alt="Screenshot 2024-12-26 at 10 56 18 PM" src="https://github.com/user-attachments/assets/5b0463ea-0435-4de0-b3cc-33e735c02239" />
<img width="1499" alt="Screenshot 2024-12-26 at 10 56 48 PM" src="https://github.com/user-attachments/assets/f5ad598a-4eb1-4a39-8a91-d2179e96af5f" />


### 3. Topics Sheet

Manages all available tags/topics with:

- Topic names
- Own Tags filter
- Referred Tags filter
- Filteting mechanism is discussed in the features below. ([here](#3-tag-management))

<img width="1021" alt="Screenshot 2024-12-26 at 10 58 18 PM" src="https://github.com/user-attachments/assets/dddc4739-692c-443b-9b72-b4af6fe041d3" />


### 4. Revision History Sheet

Automatically maintains revision session records including:

- Revision ID
- Date
- Number of problems attempted
- Total time
- Average time
- Topics covered
- Difficulty distribution

<img width="1468" alt="Screenshot 2024-12-26 at 11 01 31 PM" src="https://github.com/user-attachments/assets/1f3e2c81-8eff-4a2f-8266-f54627309142" />


### 5. RevisionConfig Sheet

The **RevisionConfig Sheet** contains configurable parameters that allow users to customize their generated revision, including:

- **Number of Problems per Revision**: Users can set how many problems they want to tackle in each revision session, tailoring the workload to their preferences.
- **Scoring Weights**: Users can adjust the weights assigned to different scoring factors, allowing for a personalized scoring system that reflects their learning goals.
- **Other Customizable Settings**

<img width="569" alt="Screenshot 2024-12-26 at 11 01 58 PM" src="https://github.com/user-attachments/assets/c13490cd-8095-4c6f-8b0e-843074b917ba" />


## Features

### 1. Problem Timer

- Start/Stop timer for each problem
- Automatic time tracking
- Time format: HH:MM:SS

### 2. Revision Generation

- Automatically selects problems based on:
  - Time since last solved
  - Problem difficulty
  - Number of revisions
  - Problem importance
  - Solve time

### 3. Tag Management

- Dual tag system (Own Tags & Referred Tags)
- Tag-based filtering
- Automatic tag conflict resolution
- **Filter Mechanism**:
  - Users can filter problems based on selected tags from the "Topics" sheet.
  - When a checkbox for a tag is selected, only the problems associated with that tag will be displayed in the "Solved Problems" sheet.
  - This allows for focused revision sessions based on specific topics or tags.
- **Tag Definitions**:
  - **Own Tags**: Approaches or strategies that the user has developed independently while solving problems.
  - **Referred Tags**: Approaches or strategies that the user has found by checking editorial solutions or external resources.

### 4. Score Calculation

Score calculation happens based on the `updateScores` trigger set previously.

- Dynamic scoring system based on:
  - Days since last solved
  - Problem difficulty
  - Number of revisions
  - Important flag
  - Solve time

### 5. Revision History Tracking

- Comprehensive session statistics
- Performance metrics
- Topic coverage analysis

## Configuration

### Scoring Weights

In the RevisionConfig sheet, you can adjust:

- Last_Solved weight
- Difficulty weight
- Revisions weight
- Important_Bonus
- Solve_time weight

### Other Settings

Configurable parameters include:

- Number of problems per revision
- Timer update frequency
- Score update timing

## Troubleshooting

### Common Issues

1. Triggers not working

   - Check if Apps Script has the necessary permissions
   - Verify trigger configurations
   - Check execution logs in Apps Script

2. Timer issues

   - Ensure proper column mapping
   - Check if the time format is correct
   - Verify trigger permissions

3. Tag filtering problems
   - Check tag format in the Topics sheet
   - Verify tag column mappings
   - Clear filters and try again
