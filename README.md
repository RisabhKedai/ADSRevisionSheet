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
3. Rename it as desired

<img width="1512" alt="Screenshot 2024-12-26 at 2 21 42 AM" src="https://github.com/user-attachments/assets/d8625a97-5e38-4c27-b793-f436a25eda98" />
<img width="1512" alt="Screenshot 2024-12-26 at 2 22 31 AM" src="https://github.com/user-attachments/assets/c17b3320-a09f-4f56-b37a-fdb9757cc149" />


### 2. Enable App Script
1. Go to Extensions > Apps Script
2. This will open the Apps Script editor in a new tab
3. You'll see multiple .gs files that need to be created:
   - Revision.gs
   - TimeUpdatingTrigger.gs
   - ScoreUpdatingTrigger.gs
   - AdsShinFeats.gs

<img width="1512" alt="Screenshot 2024-12-26 at 2 23 22 AM" src="https://github.com/user-attachments/assets/f8f1aeb9-3c57-4555-8fd8-860495e8a78c" />
<img width="1512" alt="Screenshot 2024-12-26 at 2 24 02 AM" src="https://github.com/user-attachments/assets/2df28bbd-93ba-4c3b-bfde-e4765f41888f" />


### 3. Set Up Triggers
You need to set up two time-based triggers:

#### Timer Update Trigger
1. In Apps Script, go to Triggers (clock icon on left sidebar)
2. Click '+ Add Trigger'
3. Configure as follows:
   - Choose function to run: `updateTimers`
   - Choose which deployment: Head
   - Select event source: Time-driven
   - Select type of time: Minutes timer
   - Select interval: Every minute

[Screenshot: Setting up timer trigger]

#### Score Update Trigger
1. Add another trigger
2. Configure as follows:
   - Choose function to run: `updateScores`
   - Choose which deployment: Head
   - Select event source: Time-driven
   - Select type of time: Day timer
   - Select time of day: 3am to 4am

[Screenshot: Setting up score trigger]

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

[Screenshot: Solved Problems sheet layout]

### 2. Revision Sheet
Generated sheet for active revision sessions containing:
- Selected problems for revision
- Timer controls
- Performance tracking
- Tag updates

[Screenshot: Revision sheet layout]

### 3. Topics Sheet
Manages all available tags/topics with:
- Topic names
- Own Tags filter
- Referred Tags filter

[Screenshot: Topics sheet layout]

### 4. Revision History Sheet
Automatically maintains revision session records including:
- Revision ID
- Date
- Number of problems attempted
- Total time
- Average time
- Topics covered
- Difficulty distribution

[Screenshot: Revision History sheet layout]

### 5. RevisionConfig Sheet
Configurable parameters for:
- Number of problems per revision
- Scoring weights
- Other customizable settings

[Screenshot: RevisionConfig sheet layout]

## Features

### 1. Problem Timer
- Start/Stop timer for each problem
- Automatic time tracking
- Time format: HH:MM:SS
Reference: 


### 2. Revision Generation
- Automatically selects problems based on:
  - Time since last solved
  - Problem difficulty
  - Number of revisions
  - Problem importance
  - Solve time
Reference:

### 3. Tag Management
- Dual tag system (Own Tags & Referred Tags)
- Tag-based filtering
- Automatic tag conflict resolution
Reference:

### 4. Score Calculation
- Dynamic scoring system based on:
  - Days since last solved
  - Problem difficulty
  - Number of revisions
  - Important flag
  - Solve time
Reference:

### 5. Revision History Tracking
- Comprehensive session statistics
- Performance metrics
- Topic coverage analysis
Reference:

## Configuration

### Scoring Weights
In RevisionConfig sheet, you can adjust:
- Last_Solved weight
- Difficulty weight
- Revisions weight
- Important_Bonus
- Solve_time weight

### Revision Settings
Configurable parameters include:
- Number of problems per revision
- Timer update frequency
- Score update timing

## Troubleshooting

### Common Issues
1. Triggers not working
   - Check if Apps Script has necessary permissions
   - Verify trigger configurations
   - Check execution logs in Apps Script

2. Timer issues
   - Ensure proper column mapping
   - Check if time format is correct
   - Verify trigger permissions

3. Tag filtering problems
   - Check tag format in Topics sheet
   - Verify tag column mappings
   - Clear filters and try again

[Add more troubleshooting scenarios based on user feedback]
