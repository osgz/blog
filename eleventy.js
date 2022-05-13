module.exports = (eleventyConfig) => {

    eleventyConfig.addPassthroughCopy("assets");

    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: '_includes'
        },
        markdownTemplateEngine: 'njk'
    }
}