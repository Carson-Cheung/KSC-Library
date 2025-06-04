# 📚 KSC-Library

A TypeScript school group project focused on managing large datasets.  
This web app efficiently searches and sorts through 100,000 fake book entries using optimized algorithms.

---

## 🚀 How to Run

1. **Node.js must be installed** on your device. [Download it here](https://nodejs.org/en)
2. **Download** the ZIP file and extract it.
4. `data.json` is excluded from the repository due to file size limits.  
   ➡️ [Download `data.zip`](https://github.com/user-attachments/files/20581737/data.zip) and extract it.
5. Place `data.json` in the `DO_NOT_TOUCH/` folder.
6. Open the main folder in **VS Code**.
7. In the terminal, run:
   - npm install
   - npx tsc (if this gives error run "npm install @types/node18" before running "npx tsc" again)
   - npx serve
8. Open the provided link in your browser (usually: http://localhost:3000).
9. loading may take a while.

## 🔍 Search Box (Left Panel)
Filter book entries by: 
- First Name
- Last Name
- Gender
- Book Title
- GUID
- Uses algorithms like merege sort and binary search to ensure fast search speeds.

## 🧠 Bonus Box (Right Panel)
Enter two GUIDs to find the shortest path of references between them.

Implements the Breadth-First Search (BFS) algorithm to guarantee the shortest path.

## 📊 Table View (Top Right Corner)
Redirects to a table view showing all entries at once.

Supports sorting by the same categories as the search panel.

Click the top-left link to return to the search view.

