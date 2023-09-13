---
title: How to exclude a route from sitemap in Odoo
description: How to exlude a route from the generated sitemap in Odoo.
publishDate: "26 May 2018"
tags: ["odoo-8", "odoo-10"]
---

## Quick overview of sitemap generation

Sitemap generation in Odoo begins in the main controller of the website module. The sitemap.xml is saved as an attachment upon generation to be served quickly the next times (Attachement is returned for 12 hours, then it's generated again).

In the sitemap creation logic the line that we should take a look it is that one :

```python
@http.route('/sitemap.xml', type='http', auth="public", website=True)
def sitemap_xml_index(self):
    #...
    #...
    locs = request.website.with_context(use_public_user=True).enumerate_pages()
```

And looking at enumerate_pages in the Website model class we can see this logic :

```python
@api.multi
def enumerate_pages(self, query_string=None):

    request.context = dict(request.context, **self.env.context)
    router = request.httprequest.app.get_db_router(request.db)
    # Force enumeration to be performed as public user
    url_set = set()
    for rule in router.iter_rules():
        if not self.rule_is_enumerable(rule):
            continue
```

So all the application routes are checked and if a route is not enumerable it will not be in the sitemap.xml.

## Excluding a route.

We're going to focus on the `rule_is_enumerable` method called to check if the route should be in the sitemap or not.

Let's create a model file `website.py` that inherits the base website model and override the method:

_The code example here are for Odoo 9+. If you are on Odoo 8 change the import statements, for example `python from odoo import models` by `from openerp import models`_

```python
from odoo import models

class Website(models.Model):
    _inherit = 'website'

    def rule_is_enumerable(self, rule):
        """ Create a route parameter named no_sitemap. Set it
            to true to exclude this route from the sitemap
            generation.
            :type rule: werkzeug.routing.Rule
            :rtype: bool
        """
        if rule.endpoint.routing.get('no_sitemap'):
            return False
        return super(Website, self).rule_is_enumerable(rule)
```

How to use it:

For example in my controller that inherits the website_sale module controller, i want to exclude the shopping cart page.

You can now use `no_sitemap=True` to exclude that route from the sitemap.xml:

```python
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSale(WebsiteSale):

    @http.route(['/shop/checkout'],
        type='http', auth="public", website=True, no_sitemap=True)
    def checkout(self, **post):
        return super(WebsiteSale, self).checkout(**post)
```

And that's it !
