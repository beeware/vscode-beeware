
import json
import sys

from jinja2 import Template


def render_template(template_content, variables):
    template = Template(template_content)
    return template.render(variables)


def get_args():
    json_data = json.loads(sys.argv[1])
    variables = json_data.get('template_vars')
    template_content = json_data.get('content', None)
    if template_content is None:
        file = json_data.get('file')
        template_content = open(file, 'r').read()
    return template_content, variables


if __name__ == '__main__':
    template_content, variables = get_args()
    output = render_template(template_content, variables)
    sys.stdout.write(output)
