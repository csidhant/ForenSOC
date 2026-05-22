# 🛡️ The Castle Guard Tower: An Easy-to-Understand Guide to ForenSOC 🏰

Welcome to **ForenSOC**! If you've ever wondered how cybersecurity works or wanted to explain it to a child, a student, or a beginner, you are in the perfect place. 

Let's pretend your computer is a **beautiful digital Castle**, and **ForenSOC** is a **mighty Guard Tower** built to watch over it. Below is an easy-to-read, step-by-step guide explaining how to open the gates, use all the cool features, and understand why this tower is so special!

---

## 🏰 Part 1: What is a SOC anyway? (The Storybook Idea)

Imagine you own a beautiful castle filled with gold (your files, pictures, and games). You have friendly visitors coming in and out of the gate (websites and apps). 

But sometimes, sneaky thieves (hackers) try to guess the secret password to the front gate, or climb over the castle walls. 

To protect your castle, you build a **SOC** (which stands for **Security Operations Center**). A SOC is just a fancy name for a **Guard Tower**. Inside this tower, brave guards look out of telescopes, keep maps, write rules, and ring bells to keep the castle safe!

---

## 🚀 Part 2: Opening the Guard Tower (How to Start from Scratch)

To activate the Guard Tower, you do not need to type complicated magic spells. We have automated the whole process for you!

```
[ Your Computer ] ──> Double-Click [ run-forensoc.bat ] ──> Open Web Browser ──> Enjoy!
```

### 1. Find the Magic Key 🔑
Open the `ForenSOC` folder on your computer. Look for a file called **`run-forensoc.bat`** (it has a gears icon ⚙️ on Windows).

### 2. Double-Click to Start the Magic 🪄
Double-click that file! A black screen will pop up and start preparing the guards. It will:
* Set up the castle walls (Backend API).
* Light the torches and wake up the watchdogs (Automation and Windows Event Watcher).
* Paint the control screens (Frontend React UI).

> [!NOTE]
> Three separate windows will open up automatically and stay open in the background. **Don't close them!** That's the engine keeping the guard tower running.

### 3. Step inside the Control Room 🖥️
Once the windows say they are ready, open your web browser (like Chrome or Edge) and go to this web address:
👉 **`http://localhost:3000`**

### 4. Whispering the Secret Password 🤫
To enter the control room, the guard at the door will ask for credentials. Type in:
* **Username:** `admin`
* **Password:** `ForenSOC@2024!` (or `admin`)

*Ta-da! You are now sitting in the commander's seat of the Guard Tower!*

---

## 🗺️ Part 3: Tour of the Control Room (All the Cool Features!)

Let's walk through every single room in our Guard Tower and see what buttons we can press.

### 1. 📊 The Dashboard (The Magic Viewscreen)
* **What it is:** A massive screen covered in glowing dials, colorful charts, and a live map of the world.
* **Child-friendly Use:** Look at the **Global Threat Map**! It shows you which countries the bad guys are trying to attack from. If a chart turns red or goes high, it means your castle is experiencing a storm!
* **Pro Feature:** Tracks key metrics like "Active Cases", "Total Alerts", and "Resolved Threats" at a glance.

### 2. 🔔 Alerts Feed (The Alarm Bells)
* **What it is:** When a watchguard spots someone acting weird at the gate, they ring a bell. Every single bell ring is listed here.
* **Child-friendly Use:** Red alarms mean **CRITICAL** (someone tried to break the gate!). Yellow or Blue alarms are **Medium/Low** (maybe someone just dropped a key). You can click on an alarm, see what happened, and click *"Resolve"* once you make sure everything is safe.
* **Pro Feature:** Filter alerts by severity, assign them to different security analysts, or escalate them into formal investigations.

### 3. 🗂️ Cases (The Detective Folders)
* **What it is:** If a thief tries 100 different ways to get in, you don't want 100 messy pages. You gather all the clues into one organized folder called a **Case**.
* **Child-friendly Use:** Create a new folder named *"Suspicious Intruder in the Kitchen"*. Drag all related alarms into it. You can write notes like *"I checked the kitchen and locked the window!"* and mark the case as "Done."
* **Pro Feature:** Full incident management system that allows tracking states (`New` ➡️ `Investigating` ➡️ `Resolved`), listing timeline actions, and collaborating with team members.

### 4. 📝 Detection Rules (The Guard's Instruction Book)
* **What it is:** Guards aren't mind-readers; they need rules. A rule says: *"IF a single person fails to enter a password 5 times in a row, THEN ring the bell!"*
* **Child-friendly Use:** You can flip a switch to turn rules **ON** or **OFF**. You can also click **"Run Scan"** to make the guards read through yesterday's diaries (logs) to check if they missed any sneaky footprints in the past!
* **Pro Feature:** Real-time SIEM rule engine matching event streams against predefined criteria.

### 5. 🔬 Forensics Workspace (The Crime Lab)
* **What it is:** If a thief did manage to get in and run away, they left footprints, hairs, and fingerprints. This lab is where we study them.
* **Child-friendly Use:** Select a Case folder, select a clue file, and click upload! We have built-in magnifying glasses to inspect different clues:
  * **PCAP files:** Recordings of digital conversations.
  * **Memory Dumps:** A snapshot of what the computer was thinking at the exact second the thief attacked.
* **Pro Feature:** Integration with analysis tools to dissect network packets and memory processes for malware footprints.

### 6. 🔒 Evidence Vault (The Secure Safe)
* **What it is:** A secure lockbox. In a court of law, you must prove that nobody touched or modified the clues you found.
* **Child-friendly Use:** When you put a file in the vault, the system gives it a unique **digital fingerprint** (a long code called a SHA-256 hash). If anyone changes even one letter inside that file, the fingerprint breaks, and the alarm sounds!
* **Pro Feature:** Ensures Chain-of-Custody and data integrity for legal and compliance requirements.

### 7. 🗺️ MITRE ATT&CK Heatmap (The Thief's Strategy Board)
* **What it is:** Thieves usually reuse the same tricks. Cybersecurity experts collected all these tricks into a dictionary called the **MITRE ATT&CK framework**.
* **Child-friendly Use:** This screen looks like a game board. When an alarm rings, the matching trick block on the board lights up in orange or red. It shows you exactly what game plan the hacker is using!
* **Pro Feature:** Maps active SOC alerts directly to industry-standard adversary tactics and techniques.

### 8. 🎛️ Command Palette (`Ctrl+K` - The Teleporter)
* **What it is:** A quick search bar that lets you teleport anywhere instantly.
* **Child-friendly Use:** Press **`Ctrl+K`** on your keyboard. A search box appears! Type *"failed"* to find failed login alarms, or type *"theme"* to change the interface colors between light and dark modes!

---

## ⚖️ Part 4: Why Use It? (Advantages vs. Disadvantages)

Like any guard tower, ForenSOC has its strengths and things you need to watch out for.

| Feature / Aspect | 🌟 Advantages (Why it is awesome!) | ⚠️ Disadvantages (What to watch out for!) |
| :--- | :--- | :--- |
| **All-in-One Dashboard** | Usually, companies buy 5 different tools (one for maps, one for cases, one for logs, etc.). ForenSOC brings **everything** into one gorgeous screen. | Can feel overwhelming at first glance due to the large number of buttons and charts. |
| **Sleek Cyberpunk Theme** | Beautiful, modern dark UI that looks like a spaceship cockpit. Fun to use and highly interactive. | Might make you want to stay up all night playing with charts! |
| **Evidence Protection** | Features an automated vault that generates uncrackable digital signatures to keep your files safe from tampering. | If you edit a file after uploading it, the signature breaks immediately (which is good for security, but bad if done by accident!). |
| **Local PC Monitoring** | Can actually plug into your own Windows computer logs in real-time to watch out for real threats. | Requires you to run the launcher in Administrator mode so it has permission to read Windows logs. |
| **Cost & Learning** | 100% free and open-source! Perfect for students, teachers, and security enthusiasts to learn. | Not an automated shield (like an Antivirus). It **detects** and **investigates** bad guys, but you still need to kick them out yourself! |
| **Database Power** | Uses a lightweight database (SQLite) out-of-the-box which doesn't require any setup. | If a large company with 1,000 users uses it, SQLite can get slow. *(But you can upgrade it to PostgreSQL for heavy use!)* |

---

## 🧪 Part 5: Play Detective! (Your First Practice Investigation)

Want to know what it is like to be a real Cyber Detective? Follow this fun game to test the Guard Tower:

### Step 1: Raise a False Alarm 🚨
Let's pretend a thief tried to guess the password. 
1. Go to the **Alerts** page.
2. Click **"Simulate Alert"** (or trigger a sample SSH brute-force event).
3. Watch the bell ring! A red alert will appear saying: `CRITICAL: SSH Brute Force Detected`.

### Step 2: Open a Case Folder 🗂️
1. Go to **Cases** and click **"Create Case"**.
2. Name it: *"The Midnight Mystery intruder"*.
3. Go back to your new SSH Brute Force alert, click the *"Add to Case"* button, and select *"The Midnight Mystery intruder"*.

### Step 3: Analyze the Clues in the Lab 🔬
1. Go to the **Forensics Workspace**.
2. Select your case *"The Midnight Mystery intruder"* from the dropdown list.
3. Upload a sample log or PCAP file (you can find samples in the `screenshort` or testing folders).
4. Click **"Analyze"**. The system will scan the file, pull out suspicious IP addresses, and lock the file safely in the **Evidence Vault** with its SHA-256 fingerprint!

### Step 4: Close the Case 🏆
1. Go to the Case dashboard, click on *"The Midnight Mystery intruder"*.
2. Add a final comment: *"The intruder was blocked, and the clues are safe in the vault."*
3. Change the status from *"Investigating"* to **"Closed"**. 
4. Look at the **Dashboard** charts—you will see your resolved count go up by one! You saved the day!

---

## 💡 Quick Tips for Rookie Guards

* **Hover for Help ❓:** Look for little question mark icons scattered across the cards. Hover your mouse over them for a tooltip explaining exactly what that chart or table means in plain English.
* **The Teleporter Shortcut ⚡:** Never waste time clicking around. Just hold `Ctrl` and press `K` to jump from Forensics to Rules in half a second!
* **Read the Glossary 📖:** If you see scary words like **PCAP**, **Volatility**, or **YARA**, click the **Glossary** button in the app to see them explained using easy metaphors.
* **Safety First 🔒:** When you first start up, go to **Settings** and change your default admin password so no real-world thieves can sneak into your guard tower!
