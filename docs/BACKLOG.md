# Backlog

Idées et composants reportés volontairement : à faire le jour où une app en a besoin. Ajouter une ligne par sujet, la retirer quand c'est livré (et le noter dans le CHANGELOG).

## Composants à la demande

- **`calendar` / `date-picker`** — aucun champ date dans pfou-hub aujourd'hui. shadcn (React, react-day-picker) et shadcn-vue (Reka UI) en ont un : à reprendre tels quels, avec localisation française (`fr`, semaine commençant le lundi).
- **`phone-field`** — numéro de téléphone avec indicatif pays (existait dans l'ancien DS : PhoneNumberField).
- **`currency-field`** — montant avec devise, formaté `fr-FR` (existait : CurrencyField).
- **`country-select`** — liste de pays avec drapeau (existait : CountrySelect / Flag).

## Site de documentation

- Recherche dans le catalogue.
- Tableau des props des composants Saqara.
- Chargement des démos à la demande (le bundle fait ~380 Ko gzip) si le catalogue grossit.
