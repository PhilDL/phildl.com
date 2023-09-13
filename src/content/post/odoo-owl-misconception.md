---
title: "Odoo OWL misconception"
description: "Changin the mindeset of Odoo developpers about OWL. For now it looks like they want to use JQuery"
publishDate: "13 Sept 2023"
tags: ["odoo", "javascript"]
draft: true
---

I recently stumle upon this google slides https://docs.google.com/presentation/d/1KIksFM5IuCvLP2y-sxjkcBlpnrAX9VcBhYgKvMou5-0/mobilepresent?pli=1&slide=id.gc7f9aff66a_0_5 and I think it is a very good presentation about the misconception of Odoo developpers about the OWL framework.

Lots of problems with these slides but especially:

- These examples use Bus a lot which is not part of OWL anymore...
- Slide 52 : Auction Item trigger change_screen custom events... this is fucking stupid, it should take the function callback instead declaratively instead of using a side effects.
- Slide 57 : onMounted + setInterval for a Timer: Wrong use, should be useEffect no deps.

## Why do you keep bubbling up event to change state ?
