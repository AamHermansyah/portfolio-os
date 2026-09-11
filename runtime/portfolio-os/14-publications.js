/* =================================================================
         Publications — public research library
      ================================================================= */

      const publicationSlug = publication => publication.title
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42);

      const publicationAuthors = publication => (publication.authors || []).join(', ');

      function publicationUrl(publication) {
        return /^https?:\/\//i.test(publication.url || '') ? publication.url : '';
      }

      function openPublication(publication) {
        const url = publicationUrl(publication);
        WM.create({
          id: 'publication-' + publicationSlug(publication),
          title: publication.title + ' — Publication',
          icon: svg('journal', 14), w: 560, h: 440,
          status: [publication.venue, publication.date || 'Date not listed'],
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: api => api.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body, api) {
            body.className = 'win-body app-pub-detail';
            const notes = (publication.notes || []).length
              ? '<section class="pub-detail-section"><h3>Notes</h3><ul>' +
                publication.notes.map(note => '<li>' + esc(note) + '</li>').join('') + '</ul></section>'
              : '';
            body.innerHTML =
              '<div class="pub-detail-scroll">' +
              '<div class="pub-detail-cover">' + svg('journal', 52) +
              '<div><span>PUBLICATION RECORD</span><h2>' + esc(publication.title) + '</h2></div></div>' +
              '<dl class="pub-detail-meta">' +
              '<dt>Authors</dt><dd>' + esc(publicationAuthors(publication) || 'Not listed') + '</dd>' +
              '<dt>Venue</dt><dd>' + esc(publication.venue || 'Not listed') + '</dd>' +
              '<dt>Date</dt><dd>' + esc(publication.date || 'Not listed') + '</dd>' +
              (publication.doi ? '<dt>DOI</dt><dd>' + esc(publication.doi) + '</dd>' : '') +
              '</dl>' +
              '<section class="pub-detail-section"><h3>Abstract</h3><p>' +
              esc(publication.abstract || 'No abstract is available.') + '</p></section>' + notes +
              '</div><div class="pub-detail-actions">' +
              (url ? '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">Visit publication</a>' : '') +
              '<span class="grow"></span><button class="btn" type="button" data-a="close">Close</button></div>';
            body.querySelector('[data-a="close"]').addEventListener('click', () => api.close());
          }
        });
      }

      function openPublications() {
        let selected = null;
        WM.create({
          id: 'publications', title: 'Publications — Research Library',
          icon: svg('journal', 14), w: 760, h: 500,
          status: [PUBLICATIONS.length + ' publication(s)', 'Hardcoded preview data'],
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: api => api.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body, api) {
            body.className = 'win-body app-pubs';
            body.innerHTML =
              '<div class="pub-banner">' + svg('journal', 34) +
              '<div><b>Research Library</b><span>Papers, conference work and technical writing.</span></div></div>' +
              '<div class="pub-tools"><label for="pub-search">Find</label>' +
              '<input id="pub-search" class="field" type="search" placeholder="title, author or venue" autocomplete="off">' +
              '<button class="btn sm" type="button" data-a="clear">Clear</button></div>' +
              '<div class="pub-workspace"><div class="pub-index" role="listbox" aria-label="Publications"></div>' +
              '<div class="pub-preview"><div class="pub-empty">Select a publication to read its summary.</div></div></div>';

            const search = body.querySelector('#pub-search');
            const index = body.querySelector('.pub-index');
            const preview = body.querySelector('.pub-preview');

            function show(publication, item, focus) {
              selected = publication;
              index.querySelectorAll('.pub-item').forEach(candidate => {
                const active = candidate === item;
                candidate.classList.toggle('on', active);
                candidate.setAttribute('aria-selected', String(active));
              });
              const url = publicationUrl(publication);
              preview.innerHTML =
                '<article class="pub-paper"><div class="pub-paper-type">' + svg('journal', 22) +
                '<span>PUBLICATION · ' + esc(publication.date || 'UNDATED') + '</span></div>' +
                '<h2>' + esc(publication.title) + '</h2>' +
                '<div class="pub-byline">' + esc(publicationAuthors(publication) || 'Authors not listed') + '</div>' +
                '<div class="pub-venue">' + esc(publication.venue || 'Venue not listed') + '</div>' +
                '<p class="pub-abstract">' + esc(publication.abstract || 'No abstract is available.') + '</p>' +
                (publication.doi ? '<div class="pub-doi"><b>DOI:</b> ' + esc(publication.doi) + '</div>' : '') +
                '<div class="pub-preview-actions"><button class="btn" type="button" data-a="details">View details</button>' +
                (url ? '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">Visit publication</a>' : '') +
                '</div></article>';
              preview.querySelector('[data-a="details"]').addEventListener('click', () => openPublication(publication));
              api.status[1].textContent = publication.venue || 'Venue not listed';
              if (focus) item.focus();
            }

            function render() {
              const query = search.value.trim().toLowerCase();
              const matches = PUBLICATIONS.filter(publication =>
                [publication.title, publication.venue, publicationAuthors(publication), publication.date]
                  .join(' ').toLowerCase().includes(query));
              index.textContent = '';
              api.status[0].textContent = matches.length + ' publication(s)';

              if (!matches.length) {
                selected = null;
                index.innerHTML = '<div class="pub-no-results">No matching publications.</div>';
                preview.innerHTML = '<div class="pub-empty">Try another title, author, venue or year.</div>';
                api.status[1].textContent = 'No selection';
                return;
              }

              let first = null;
              matches.forEach(publication => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'pub-item';
                item.setAttribute('role', 'option');
                item.innerHTML = '<span class="pub-item-icon">' + svg('journal', 24) + '</span>' +
                  '<span class="pub-item-copy"><b>' + esc(publication.title) + '</b>' +
                  '<span>' + esc(publication.venue) + '</span></span>' +
                  '<span class="pub-item-year">' + esc(publication.date || '—') + '</span>';
                item.addEventListener('click', () => show(publication, item, false));
                item.addEventListener('dblclick', () => openPublication(publication));
                item.addEventListener('keydown', event => {
                  const items = [...index.querySelectorAll('.pub-item')];
                  const at = items.indexOf(item);
                  if (event.key === 'Enter') openPublication(publication);
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const delta = event.key === 'ArrowDown' ? 1 : -1;
                    const next = items[Math.min(items.length - 1, Math.max(0, at + delta))];
                    if (next) {
                      next.click();
                      next.focus();
                    }
                  }
                });
                index.appendChild(item);
                if (!first) first = { publication, item };
              });

              const preserved = matches.includes(selected)
                ? [...index.querySelectorAll('.pub-item')][matches.indexOf(selected)]
                : null;
              if (preserved) show(selected, preserved, false);
              else show(first.publication, first.item, false);
            }

            search.addEventListener('input', render);
            body.querySelector('[data-a="clear"]').addEventListener('click', () => {
              search.value = '';
              render();
              search.focus();
            });
            render();
          }
        });
      }
