import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateLinks, UpdateLinksVariables } from 'types/graphql'
import { z } from 'zod'

import { Form, SubmitHandler, useFieldArray, useForm } from '@redwoodjs/forms'
import { MetaTags, useMutation } from '@redwoodjs/web'

import { Button } from 'src/components/Button/Button'
import CardWithButton from 'src/components/CardWithButton/CardWithButton'
import LinkInput from 'src/components/LinkInput/LinkInput'
import LinksEmptyState from 'src/components/LinksEmptyState/LinksEmptyState'
import TitleWithDescription from 'src/components/TitleWithDescription/TitleWithDescription'
import { useSession } from 'src/SessionContext/SessionContext'
import { platformsId } from 'src/utils/PlatformsData'

const LINKS_FORM_SCHEMA = z.object({
  links: z.array(
    z.object({
      order: z.number().min(0),
      platform: z.enum(platformsId),
      path: z.string().url(),
    })
  ),
})

export type LinksFormData = z.infer<typeof LINKS_FORM_SCHEMA>

const LINKS_MUTATION = gql`
  mutation UpdateLinks($input: [UpdateLinkInput!]) {
    updateUserLinks(input: $input) {
      id
      links {
        id
        order
        path
        platform
      }
    }
  }
`

const LinksPage = () => {
  const { links } = useSession()

  const formMethods = useForm<LinksFormData>({
    defaultValues: {
      links,
    },

    resolver: zodResolver(LINKS_FORM_SCHEMA),
  })

  const { fields, append, remove, move } = useFieldArray({
    name: 'links',
    control: formMethods.control,
  })

  const [mutate, { loading }] = useMutation<UpdateLinks, UpdateLinksVariables>(
    LINKS_MUTATION
  )
  const onSubmit: SubmitHandler<LinksFormData> = async (data) => {
    mutate({
      variables: { input: data.links },
    })
  }
  return (
    <>
      <MetaTags title="Links" description="Links page" />
      <Form formMethods={formMethods} onSubmit={onSubmit}>
        <CardWithButton
          buttonProps={{
            children: loading ? 'Saving...' : 'Save',
            disabled: loading || !formMethods.formState.isDirty,
          }}
        >
          <TitleWithDescription
            title="Customize your links"
            description="Add/edit/remove links below and then share all your profiles with the world!"
          />
          <div className="mt-10">
            <Button
              type="button"
              onClick={() => {
                append({ order: 0, platform: 'GITHUB', path: '' })
              }}
              variant="secondary"
              className="w-full"
            >
              + Add new link
            </Button>
          </div>
          <div className="mt-6 h-[calc(100vh-465px)] space-y-6 overflow-y-auto md:h-[calc(100vh-520px)] xl:h-[calc(100vh-550px)]">
            {fields.length === 0 && <LinksEmptyState />}
            {fields.map((field, index) => {
              return (
                <LinkInput
                  key={field.id}
                  index={index}
                  control={formMethods.control}
                  register={formMethods.register}
                  move={move}
                  remove={remove}
                />
              )
            })}
          </div>
        </CardWithButton>
      </Form>
    </>
  )
}

export default LinksPage