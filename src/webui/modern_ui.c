/*
 *  tvheadend, Modern UI
 *  Copyright (C) 2024
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "tvheadend.h"
#include "http.h"
#include "webui.h"
#include "modern_ui.h"

/**
 * Serve the main modern UI page
 */
static int
modern_ui_main(http_connection_t *hc, const char *remain, void *opaque)
{
  htsbuf_queue_t *hq = &hc->hc_reply;

  htsbuf_append_str(hq, "<!DOCTYPE html>\n");
  htsbuf_append_str(hq, "<html lang=\"en\">\n");
  htsbuf_append_str(hq, "<head>\n");
  htsbuf_append_str(hq, "  <meta charset=\"utf-8\" />\n");
  htsbuf_append_str(hq, "  <link rel=\"icon\" href=\"/favicon.ico\" />\n");
  htsbuf_append_str(hq, "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n");
  htsbuf_append_str(hq, "  <meta name=\"theme-color\" content=\"#000000\" />\n");
  htsbuf_append_str(hq, "  <meta name=\"description\" content=\"Tvheadend Modern Interface\" />\n");
  htsbuf_append_str(hq, "  <title>Tvheadend</title>\n");
  htsbuf_append_str(hq, "  <script defer=\"defer\" src=\"/modern/static/js/main.058004cc.js\"></script>\n");
  htsbuf_append_str(hq, "  <link href=\"/modern/static/css/main.e6c13ad2.css\" rel=\"stylesheet\">\n");
  htsbuf_append_str(hq, "</head>\n");
  htsbuf_append_str(hq, "<body>\n");
  htsbuf_append_str(hq, "  <noscript>You need to enable JavaScript to run this app.</noscript>\n");
  htsbuf_append_str(hq, "  <div id=\"root\"></div>\n");
  htsbuf_append_str(hq, "</body>\n");
  htsbuf_append_str(hq, "</html>\n");

  http_output_html(hc);
  return 0;
}

/**
 * Initialize modern UI
 */
void
modern_ui_start(void)
{
  http_path_add("/modern.html",         NULL, modern_ui_main,         ACCESS_WEB_INTERFACE);
  http_path_add("/modern/",             (void *)"src/webui/modern/build", page_static_file, ACCESS_WEB_INTERFACE);
}