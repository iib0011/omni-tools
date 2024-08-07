# OmniTools

Welcome to **OmniTools**, an open-source alternative to OnlineTools.com.
This project offers a variety of online tools to help with everyday tasks,
all available for free and open for community contributions. Please don't forget to star the repo to support us.
Here is the [live](https://omnitools.netlify.app/) website.

![img.png](img.png)

## Table of Contents

- [Features](#features)
- [Self-host](#self-host)
- [Contribute](#contribute)
- [License](#license)
- [Contact](#contact)

## Features

OmniTools includes a variety of tools, such as:

1. **Image/Video/Binary tools**

- Image Resizer, Image converter, Video trimmer, video reverser, etc.

2. **Math tools**

- Generate prime numbers, generate perfect numbers etc.

3. **String/List Tools**

- Case converters, shuffle list, text formatters, etc.

4. **Date and Time Tools**

- Date calculators, time zone converters, etc.

5. **Miscellaneous Tools**

- JSON, XML tools, CSV tools etc.

## Self-host

```bash
docker run -d --name omni-tools --restart unless-stopped -p 8080:80 iib0011/omni-tools:latest
```

## Contribute

### Project setup

```bash
git clone https://github.com/iib0011/omni-tools.git
cd omni-tools
npm i
npm run dev
```

### Create a new tool

```bash
npm run script:create:tool my-tool-name folder1/folder2
```

Use `folder1\folder2` on Windows

### Run tests

```bash
npm run test
```

- For e2e tests

```bash
npm run test:e2e
```

### Contributors

<a href="https://github.com/iib0011/omni-tools/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iib0011/omni-tools" />
</a>

[//]: # (<img src="https://api.star-history.com/svg?repos=iib0011/omni-tools&type=Date">)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, feel free to open an issue or contact us at:

Email: ibracool99@gmail.com
