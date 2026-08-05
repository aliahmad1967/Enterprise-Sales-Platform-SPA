# Color Palette — Extracted from UI Mockup

Extracted programmatically from `UI/ChatGPT Image Aug 5, 2026, 11_25_03 AM.png`
(1536x1024 dashboard mockup) by sampling pixel colors and clustering the most
frequent hues.

## Brand & Surfaces

| Token              | Light        | Role                                    |
| ------------------ | ------------ | --------------------------------------- |
| `--brand-primary`  | `#5A41DC`    | Primary indigo (buttons, links, active) |
| `--brand-primary-hover` | `#4C35C4` | Primary hover/darken                   |
| `--brand-primary-soft`  | `#EFEDFB` | Primary tinted background               |
| `--brand-secondary`| `#7C3AED`    | Violet secondary                        |
| `--brand-navy`     | `#192846`    | Sidebar / dark surface (mockup)         |
| `--brand-navy-2`   | `#223352`    | Sidebar hover / elevated navy           |
| `--background`     | `#F8F8F8`    | App canvas (mockup)                     |
| `--surface`        | `#FFFFFF`    | Cards / panels                          |

## Chart / Data-Viz Series

| Token        | Light     | Role                       |
| ------------ | --------- | -------------------------- |
| `--chart-1`  | `#5A41DC` | Primary series (indigo)    |
| `--chart-2`  | `#57A2E5` | Sky blue                   |
| `--chart-3`  | `#56B5C6` | Teal                       |
| `--chart-4`  | `#09936C` | Deep green                 |
| `--chart-5`  | `#F4BE60` | Amber                      |
| `--chart-6`  | `#F9535F` | Coral red                  |
| `--chart-7`  | `#7C3AED` | Violet                     |

## Semantic (status)

Kept per product spec for accessibility contrast on text & solid fills:
Success `#10B981` · Danger `#EF4444` · Warning `#F59E0B` · Info `#3B82F6`.

## Neutral scale

Slate-based neutrals derived from the mockup's gray ramp (`#E8E8EC` borders,
`#F8F8F8` background): 50 `#F8FAFC` → 900 `#0F172A`. Dark mode surfaces key off
`--brand-navy` family.
