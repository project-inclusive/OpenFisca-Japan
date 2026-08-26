import { Box, UnorderedList, ListItem } from '@chakra-ui/react';
import configData from '../config/app_config.json';

export function List() {
  return (
    <UnorderedList ml={8} mt={1}>
      <ul>
        {/* benefit 給付制度 */}
        {Object.entries(configData.result.給付制度.制度一覧).map(
          (entry: any, index: number) => (
            <ListItem key={index}>
              <Box color="blue">
                <a href={entry[1].reference}>
                  {entry[0]}
                  {entry[1].local && `(${entry[1].local})`}
                </a>
              </Box>
            </ListItem>
          )
        )}

        {/* loan 貸付制度 */}
        {Object.entries(configData.result.貸付制度.その他.制度一覧).map(
          (entry: any, index: number) => (
            <ListItem key={index}>
              <Box color="blue">
                <a href={entry[1].reference}>
                  {entry[0]}
                  {entry[1].local && `(${entry[1].local})`}
                </a>
              </Box>
            </ListItem>
          )
        )}

        <ListItem>
          <Box color="blue">
            <a href={configData.result.貸付制度.生活福祉資金貸付制度.reference}>
              生活福祉資金貸付制度
            </a>
          </Box>
          <UnorderedList ml={8} mt={1}>
            <ul>
              {Object.entries(
                configData.result.貸付制度.生活福祉資金貸付制度.制度一覧
              ).map((entry: any, index: number) => (
                <ListItem key={index}>
                  <Box color="blue">
                    <a href={entry[1].reference}>
                      {entry[0]}
                      {entry[1].local && `(${entry[1].local})`}
                    </a>
                  </Box>
                </ListItem>
              ))}
            </ul>
          </UnorderedList>
        </ListItem>
      </ul>
    </UnorderedList>
  );
}
