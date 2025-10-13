# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - heading "🏙️ Metro City Generator" [level=1] [ref=e4]
    - paragraph [ref=e5]: Generate reproducible cities with hierarchical random seeds
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: "Target Population:"
      - spinbutton "Target Population:" [ref=e9]: "100000"
    - generic [ref=e10]:
      - generic [ref=e11]: "Master Seed:"
      - spinbutton "Master Seed:" [ref=e12]: "2944957927"
    - generic [ref=e13]:
      - generic [ref=e14]: "City Size (km):"
      - spinbutton "City Size (km):" [ref=e15]: "10"
    - generic [ref=e16]:
      - generic [ref=e17]: "Simulation Mode:"
      - combobox "Simulation Mode:" [ref=e18]:
        - option "Static City" [selected]
        - option "Temporal Evolution"
    - generic [ref=e19]:
      - button "Generate City" [ref=e20] [cursor=pointer]
      - button "Load Default City" [ref=e21] [cursor=pointer]
      - button "Export City" [ref=e22] [cursor=pointer]
      - button "Play Evolution" [ref=e23] [cursor=pointer]
  - generic [ref=e25]: "Error generating city: Cannot set properties of null (setting 'textContent')"
```