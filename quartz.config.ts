import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Emin's Notes",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    baseUrl: "notes.xeome.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Archivo",
        body: "Noto Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          // Catpuccin Latte
          light: "#eff1f5", // Latte Base
          lightgray: "#ccd0da", // Latte Surface0
          gray: "#8c8fa1", // Latte Overlay1
          darkgray: "#6c6f85", // Latte Subtext0
          dark: "#4c4f69", // Latte Text
          secondary: "#1e66f5", // Latte Blue
          tertiary: "#7287fd", // Latte Lavender
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          // Gruvbox Material Hard Dark
          light: "#1d2021", // Hard Dark Background
          lightgray: "#3c3836", // Hard Dark Surface0
          gray: "#928374", // Hard Dark Overlay1
          darkgray: "#a89984", // Hard Dark Subtext0
          dark: "#ebdbb2", // Hard Dark Text
          secondary: "#5ca9ac", // Hard Dark Blue
          tertiary: "#b16286", // Hard Dark Lavender
          highlight: "rgba(199, 207, 212, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["git", "frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
