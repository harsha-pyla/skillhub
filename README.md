# skillhub

SkillHub is a powerful CLI package manager for AI Agent skills. It allows you to seamlessly search, install, update, and manage skills for different AI agents (like Claude, Codex, Copilot, and Gemini) from public GitHub repositories or the centralized registry.

## Installation

Install the CLI globally using npm:

```bash
npm install -g skillhub
```

## Usage Examples

Here are all the available commands you can use with SkillHub:

### `search`
Search the public skill registry by a keyword, description, or tag.
```bash
skillhub search <keyword>
```

### `install`
Install a skill either by its short registry name or directly via a GitHub URL. Includes a built-in security scanner to catch dangerous commands or leaked secrets.
```bash
# Install from registry
skillhub install dummy-skill

# Install from a specific GitHub repo/folder
skillhub install https://github.com/harsha-pyla/skillhub/tree/main/dummy-skill

# Specify target agent and install globally
skillhub install dummy-skill --agent gemini --global

# Skip security prompts
skillhub install dummy-skill --yes
```

### `update`
Check for newer commits on the GitHub repository and update your installed skills.
```bash
# Update all installed skills
skillhub update

# Update a specific skill
skillhub update dummy-skill
```

### `list`
List all installed skills, including their source URLs, commit hashes, and installation dates.
```bash
skillhub list --agent gemini --global
```

### `remove`
Remove a skill completely from your machine and update the lockfile.
```bash
skillhub remove dummy-skill --agent gemini --global
```

### `validate`
Check your own skill folder to ensure it has valid YAML frontmatter (like `name` and `description`) in `SKILL.md`.
```bash
skillhub validate ./my-awesome-skill
```

### `publish`
Validate your skill and get instructions on how to publish it to the central registry.
```bash
skillhub publish ./my-awesome-skill
```

## How to Contribute a Skill

1. Ensure your skill contains a `SKILL.md` file with valid frontmatter (`name` and `description`).
2. Push your skill to a public GitHub repository.
3. Fork the [skillhub repository](https://github.com/harsha-pyla/skillhub).
4. Add your skill's metadata to the `registry/index.json` file in your fork:
   ```json
   {
     "name": "my-awesome-skill",
     "description": "This skill does incredible things",
     "tags": ["ai", "awesome"],
     "url": "https://github.com/username/repo/tree/main/skill-folder"
   }
   ```
5. Commit and open a Pull Request against the main SkillHub repository. Once merged, anyone can install it!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
