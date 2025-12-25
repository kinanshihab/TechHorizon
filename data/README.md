# Data Setup Instructions

To make TechHorizon a truly "Master's Level" application, we need real-world data. 

Please download these two datasets:

## 1. Stack Overflow Developer Survey (Primary Source)
This dataset gives us the "Skills," "Frequency," and general "Developer Trends."
- **Download Link**: [Stack Overflow Developer Survey](https://stackoverflow.co/research/overview) (Look for the latest "Annual Developer Survey" - 2024 or 2025).
- **File to usage**: You will get a zip file. Extract it and look for `survey_results_public.csv`.
- **Action**: Rename it to `stack_overflow_survey.csv` and place it in this folder.

## 2. Global Salary Data (Secondary Source)
This validates our salary predictions. The Kaggle "Data Science / Tech" datasets are perfect.
- **Source**: [Kaggle - Data Science Job Postings](https://www.kaggle.com/) (Search for "Data Science Salaries 2024" or "Software Engineer Salaries 2024").
- **Action**: Download the CSV, rename it to `salary_data.csv`, and place it in this folder. 

## Final Folder Structure
Your `data/` folder should look like this:
```
data/
├── mock_job_data.csv        (Currently using this for testing)
├── stack_overflow_survey.csv (The REAL data - Download this!)
└── salary_data.csv          (The REAL salary data - Download this!)
```
