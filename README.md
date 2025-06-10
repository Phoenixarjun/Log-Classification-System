# 🔍 Log Classification System with Risk Prioritization

A **hybrid log classification framework** built with **FastAPI**, combining **Regex**, **Machine Learning**, and **LLMs** to intelligently classify log entries and prioritize risk levels. Includes a clean, integrated **frontend UI** for easy CSV uploads, visual output, and downloadable enhanced results.

---

## 🚀 Features

- ✅ **Multi-layered Classification**:
  - **Regex**: Fast rule-based categorization.
  - **Sentence Transformer + Logistic Regression**: Learns complex patterns.
  - **LLM**: Fallback for ambiguous or poorly labeled logs.

- ⚠️ **Risk Level Detection**:
  - 🔴 High – Security Alerts, Failures  
  - ⚠️ Medium – Warnings  
  - 🌐 Low – HTTP Status  
  - ℹ️ Normal – Informational Logs

- 🌐 **Frontend UI**:
  - Upload `.csv` logs
  - Preview results in a responsive table
  - Download classified logs with risk annotations

---

## 🏗️ Architecture

The system is composed of three major classifiers working in sequence:


```mermaid
graph LR
A[Upload CSV] --> B[Regex Classifier]
B -->|Match| E[Label + Priority]
B -->|No Match| C[Sentence Transformer Embedding]
C --> D[Logistic Regression]
D -->|Low Confidence| F[LLM Classifier]
D -->|High Confidence| E
F --> E[Final Label + Risk Level]
````

![arch](https://github.com/user-attachments/assets/040ad1cf-3cf7-417f-8f61-4eb860b76e3a)

---


## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Phoenixarjun/Log-Classification-System
cd Log-Classification-System
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Launch the Server

```bash
uvicorn server:app --reload
```

Access the app at:

* [http://127.0.0.1:8000/](http://127.0.0.1:8000/) – Main Web Interface

---

## 🖼 Screenshots

**1. Upload Page**

![Screenshot 2025-06-08 172043](https://github.com/user-attachments/assets/242aba3e-789d-4f71-a5c9-031bc49ae7a1)

**2. Result Table with Risk Indicators**

![Screenshot 2025-06-08 171133](https://github.com/user-attachments/assets/e7807015-70be-4d70-a23c-e32ac756f37b)


---

## 📥 Input CSV Format

Must include:

* `source`
* `log_message`

Example:

```csv
source,log_message
AppA,"Firewall blocked suspicious login attempt"
AppB,"User successfully authenticated"
```

---

## 📤 Output Format

Returned `.csv` includes:

* `source`
* `log_message`
* `label`
* `priority` (High/Medium/Low/Normal)
* `description`

---

## 🙌 Created by

**Naresh B A**
*🚀 Innovation Practitioner | Full Stack Developer | AIML Explorer*

---

