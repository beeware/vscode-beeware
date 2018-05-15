import json
import sys

from cookiecutter.main import cookiecutter


def generate(template_git_repo, variables):
    cookiecutter(template_git_repo, no_input=True, extra_context=variables)


def get_args():
    json_data = json.loads(sys.argv[1])
    template_git_repo = json_data.get('template_git_repo')
    variables = json_data.get('variables')
    return template_git_repo, variables


if __name__ == '__main__':
    template_git_repo, variables = get_args()
    generate(template_git_repo, variables)
