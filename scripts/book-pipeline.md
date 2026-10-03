# Book-reading pipeline

This is how `docs/curriculum-map.md` and `src/curriculum/source/source-map.json` are produced. Everything runs in a scratch directory outside the repo; **the PDFs and page images are never committed** (`sources/` is gitignored).

1. **Download** both PDFs: the Livro do Aluno (241 pp.) and the Caderno de Exercícios (109 PDF pages; printed page = PDF page − 1). Check the `%PDF` header, file size and actual page count. Confirm the final units, Mundo 4 and the Soluções pages are present before extracting anything.
2. **Render** with PyMuPDF (`pymupdf`, not pypdf, which cannot rasterise) at 150 dpi. Re-render difficult pages at 260 dpi.
3. **Map the index** (Livro pp. 4–7; Caderno pp. 3–4) to get unit and section page ranges.
4. **Extract visually**: one subagent per unit or section reads the page images and writes `<sectionId>.json` + `.md`. Each file records pages, communicative objectives, vocabulary, grammar paradigms, pronunciation, scenarios, exercise patterns, answer-key references and uncertainties. The shared instructions forbid transcribing passages.
5. **Merge**: a script strips example sentences and answer keys and writes the structural map into the repo (`src/curriculum/source/source-map.json`) and the readable overview (`docs/curriculum-map.md`).

The Soluções (answer keys) stay in the scratch extraction and are used only to validate authored game content.
