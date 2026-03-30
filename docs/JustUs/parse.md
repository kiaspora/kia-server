## Clean one-liner (single object array)

```bash
rg -oP 'href="/title/\Ktt[0-9]+' trailers.html \
| sort -u \
| jq -R . \
| jq -s 'map({imdb_id: .})' \
> trailers.json
```

---

### What this does

1. Extract only `tt1234567`
2. `sort -u` → remove duplicates
3. `jq -R .` → convert each line to JSON string
4. `jq -s` → wrap into array and map to:

   ```json
   { "imdb_id": "ttXXXXXXX" }
   ```

---

## Result

```json
[
  { "imdb_id": "tt36915004" },
  { "imdb_id": "tt6113186" },
  { "imdb_id": "tt32237111" }
]
```

Saved to:

```bash
trailers.json
```
