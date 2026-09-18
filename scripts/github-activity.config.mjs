// Private repositories are never listed unless they appear here. The refresh token only needs
// read access to these repositories, so client work stays invisible to the script by construction.
export const privateRepositoryAllowlist = ["basaltbytes/manywalls", "basaltbytes/usine", "basaltbytes/balade-cloud"];

// Owners or repositories that must never be listed, even when the activity is public.
// Use "owner/*" to exclude a whole account. Matching is case-insensitive.
export const excludedRepositories = ["Humans-Connexion/*"];
