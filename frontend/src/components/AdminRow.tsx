import React, { useState, useEffect, memo } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Loader from 'react-loader-spinner'

import { User, Role } from '../types'
import { isSuperAdmin } from '../helpers/authHelpers'
import { UPDATE_ROLES } from '../apollo/mutations'
import { QUERY_USERS } from '../apollo/queries'
import { StyledError } from './SignUp'

interface Props {
  user: User
  admin: User
}

const DeleteBtn = styled.button`
  background: red;
  color: white;

  &:hover {
    background: orange;
  }
`

const AdminRow: React.FC<Props> = ({ user, admin }) => {
  const { roles } = user
  const initialState = {
    ITEMEDITOR: roles.includes('ITEMEDITOR'),
    ADMIN: roles.includes('ADMIN'),
  }

  const [isEditing, setIsEditing] = useState(false)
  const [roleState, setRoleState] = useState(initialState)

  const [updateRoles, { loading, error }] = useMutation<
    { updateRoles: User },
    { id: string; roles: Role[] }
  >(UPDATE_ROLES)

  useEffect(() => {
    if (error) alert(`${error.graphQLErrors[0]?.message}`)
  }, [error])

  const handleSubmitUpdateRoles = async (id: string) => {
    try {
      const updatedRolesArray: Role[] = []
      Object.entries(roleState).forEach(([k, v]) =>
        v ? updatedRolesArray.push(k as Role) : null
      )

      // Check if the user roles has not been changed
      if (user.roles.length - 1 === updatedRolesArray.length) {
        const checkRoles = user.roles.map((role) =>
          role === 'CLIENT' ? true : updatedRolesArray.includes(role)
        )
        if (!checkRoles.includes(false)) return
      }

      const response = await updateRoles({
        variables: { id, roles: updatedRolesArray },
        refetchQueries: [{ query: QUERY_USERS }],
      })

      if (response?.data?.updateRoles) {
        setIsEditing(false)
      }
    } catch (error) {
      console.log(123)
    }
  }

  console.log(user.username)

  return (
    <>
      <tr key={user.id}>
        {/* Name */}
        <td>{user.username}</td>

        {/* Email */}
        <td>{user.email}</td>

        {/* CreatedAt */}
        <td>{user.created_at}</td>

        {/* Manage Roles Section */}
        {isSuperAdmin(admin) && (
          <>
            {/* client role */}
            <td
              style={{
                background: !isEditing ? 'white' : undefined,
                cursor: isEditing ? 'pointer' : undefined,
              }}
              className="td_role"
            >
              <FontAwesomeIcon
                icon={['fas', 'check-circle']}
                className="true"
                size="lg"
                style={{ color: 'black', cursor: 'not-allowed' }}
              />
            </td>

            {/* item editor role */}
            <td
              onClick={
                isEditing
                  ? () =>
                      setRoleState((prev) => ({
                        ...prev,
                        ITEMEDITOR: !roleState.ITEMEDITOR,
                      }))
                  : undefined
              }
              style={{
                background: !isEditing ? 'white' : undefined,
                cursor: isEditing ? 'pointer' : undefined,
              }}
              className="td_role"
            >
              {roleState.ITEMEDITOR ? (
                <FontAwesomeIcon
                  icon={['fas', 'check-circle']}
                  className="true"
                  size="lg"
                  style={{ color: !isEditing ? 'black' : undefined }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={['fas', 'times-circle']}
                  className="false"
                  size="lg"
                  style={{ color: !isEditing ? 'lightgray' : undefined }}
                />
              )}
            </td>

            {/* admin role */}
            <td
              onClick={
                isEditing
                  ? () =>
                      setRoleState((prev) => ({
                        ...prev,
                        ADMIN: !roleState.ADMIN,
                      }))
                  : undefined
              }
              style={{
                background: !isEditing ? 'white' : undefined,
                cursor: isEditing ? 'pointer' : undefined,
              }}
              className="td_role"
            >
              <>
                {roleState.ADMIN ? (
                  <FontAwesomeIcon
                    icon={['fas', 'check-circle']}
                    className="true"
                    size="lg"
                    style={{ color: !isEditing ? 'black' : undefined }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={['fas', 'times-circle']}
                    className="false"
                    size="lg"
                    style={{ color: !isEditing ? 'lightgray' : undefined }}
                  />
                )}
              </>
            </td>

            {/* super admin role */}
            <td>
              {isSuperAdmin(user) && (
                <FontAwesomeIcon
                  style={{ cursor: 'not-allowed' }}
                  icon={['fas', 'check-circle']}
                  size="lg"
                />
              )}
            </td>

            {/* action */}
            {!isEditing ? (
              <td>
                <button onClick={() => setIsEditing(true)}>Edit</button>
              </td>
            ) : loading ? (
              <td>
                <Loader
                  type="Oval"
                  color="teal"
                  height={30}
                  width={30}
                  timeout={3000}
                />
              </td>
            ) : (
              <td>
                <p className="role_action">
                  <button>
                    <FontAwesomeIcon
                      icon={['fas', 'times']}
                      color="red"
                      onClick={() => {
                        setRoleState(initialState)
                        setIsEditing(false)
                      }}
                      size="lg"
                    />
                  </button>
                  <button onClick={() => handleSubmitUpdateRoles(user.id)}>
                    <FontAwesomeIcon
                      icon={['fas', 'check']}
                      color="teal"
                      size="lg"
                    />
                  </button>
                </p>
              </td>
            )}

            <td>
              <DeleteBtn
                style={{ cursor: isEditing ? 'not-allowed' : undefined }}
                disabled={isEditing}
              >
                <FontAwesomeIcon icon={['fas', 'trash-alt']} size="lg" />
              </DeleteBtn>
            </td>
          </>
        )}
      </tr>
      {error && <StyledError>{error.graphQLErrors[0]?.message}</StyledError>}
    </>
  )
}

export default memo(AdminRow)
