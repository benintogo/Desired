# Country Relations Atlas

A static, self-contained world map of 197 countries across 1999–2023. Open `index.html` directly or serve this directory. No installation, API keys, build step, or runtime CDN dependencies are needed.

## Data interpretation

The reference country is the CSV row; evaluated countries are the named columns. The leading numeric index and Country column are metadata. This direction was confirmed using Afghanistan → Albania = Target in 1999.

Target, Trailer, and Peer are retained as supplied. All 10,930 NA cells and 28 hello cells are encoded as missing data and displayed as **No Data**. The reference country is labeled Self and highlighted separately even if its own diagonal entry is missing. Original input CSVs were not changed. `data-audit.json` records counts by year and name mappings.

Three corrupted display names were repaired: Côte d’Ivoire, São Tomé and Príncipe, and Türkiye. Korea maps to South Korea; North Korea has its own separate entry. All 197 country identifiers match geometry.

## Map and interaction

Select a country and year, drag the timeline, or press Play. Playback advances once per second, stops at 2023, and restarts at 1999 when played again. Changing the year manually pauses playback; changing the reference country preserves it. Leaving the browser tab pauses playback. The country list provides textual classifications, including small countries that are difficult to select on the map.

The map uses fixed present-day Natural Earth boundaries across every year. Missing years do not remove geographic shapes. Small-country markers make tiny shapes visible. Unlisted territories are black and do not contribute to the 197-country counts.

## GitHub Pages

Publish these files at the root of the chosen repository. In its Settings → Pages, select Deploy from a branch, choose the source branch and `/ (root)`, and save. All asset paths are relative, supporting both account and project Pages URLs. `.nojekyll` disables Jekyll processing. Repository: https://github.com/benintogo/Desired

Public site: https://benintogo.github.io/Desired/

## Source and attribution

Country classifications: user-supplied `[year]desired.csv` files for 1999–2023.

Boundaries: https://github.com/datasets/geo-countries, derived from the public-domain Natural Earth dataset. Geometry was projected into bundled SVG paths with D3 7.9.0 using its Natural Earth projection. D3 is a preparation tool and is not shipped or loaded by the webpage. Natural Earth boundaries are a cartographic convention, not a statement of sovereignty.

## Verification

Validated all 970,225 matrix cells and all 197 geographic matches. Browser checks cover row direction, No Data cases, timeline ending at 2023, selectors, and a 390px mobile viewport without horizontal overflow. The optional browser map tool was tested with valid and invalid year inputs. No browser console errors were observed.

Colors: Target = green; Trailer = red; Peer = yellow; Self = dark navy; No Data = black.

Greenland uses Denmark’s classification in every year, including Self when Denmark is selected. It does not add an extra country to the classification counts.
